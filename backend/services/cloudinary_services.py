from typing import Optional

from fastapi import UploadFile
import cloudinary
import cloudinary.uploader

from config import cloudinary_config


class CloudinaryServiceError(Exception):
    """Error relacionado con las operaciones de Cloudinary."""
    pass


class CloudinaryService:

    FOLDER = "antonys"

    @staticmethod
    async def upload_image(file: UploadFile) -> dict:
        """
        Sube una imagen a Cloudinary.

        Retorna:
            {
                "public_id": str,
                "secure_url": str,
                "format": str | None,
                "width": int | None,
                "height": int | None
            }
        """

        try:
            contents = await file.read()

            if not contents:
                raise CloudinaryServiceError(
                    "El archivo de imagen está vacío."
                )

            result = cloudinary.uploader.upload(
                contents,
                folder=CloudinaryService.FOLDER,
                resource_type="image",
            )

            return {
                "public_id": result["public_id"],
                "secure_url": result["secure_url"],
                "format": result.get("format"),
                "width": result.get("width"),
                "height": result.get("height"),
            }

        except CloudinaryServiceError:
            raise

        except Exception as exc:
            print("ERROR CLOUDINARY:", repr(exc))
            raise CloudinaryServiceError(
                "No se pudo subir la imagen a Cloudinary."
            ) from exc

        finally:
            await file.close()

    @staticmethod
    async def delete_image(public_id: str) -> None:
        """
        Elimina una imagen de Cloudinary mediante su public_id.
        """

        if not public_id:
            return

        try:
            result = cloudinary.uploader.destroy(
                public_id,
                resource_type="image",
                invalidate=True,
            )

            if result.get("result") not in ("ok", "not found"):
                raise CloudinaryServiceError(
                    "Cloudinary no pudo eliminar la imagen."
                )

        except CloudinaryServiceError:
            raise

        except Exception as exc:
            raise CloudinaryServiceError(
                "No se pudo eliminar la imagen de Cloudinary."
            ) from exc

    # Este metodo no lo utilizamos porque ya ProductService maneja el remplazo de imagenes, pero lo dejamos por si en el futuro se necesita.
    @staticmethod
    async def replace_image(
        new_file: UploadFile,
        old_public_id: Optional[str] = None,
    ) -> dict:
        """
        Reemplaza una imagen existente por una nueva.

        Primero sube la nueva imagen.
        La imagen anterior se elimina después.
        """

        # Primero subimos la nueva imagen.
        new_image = await CloudinaryService.upload_image(new_file)

        try:
            # Después eliminamos la anterior.
            if old_public_id:
                await CloudinaryService.delete_image(old_public_id)

        except CloudinaryServiceError:
            # La nueva imagen ya existe y puede utilizarse.
            # Propagamos el error para que ProductService
            # decida cómo manejarlo.
            raise

        return new_image