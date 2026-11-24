from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
from datetime import datetime

from services.dashboard_services import (
    getBusinessDaySummary,
    getBusinessWeekSummary,
    getDashboardOrders,
    getDashboardUsers,
    getDashboardProducts
)

def formatWorksheet(worksheet):

    # Ajustar automáticamente el ancho de las columnas
    for column in worksheet.columns:
        max_length = 0
        column_letter = get_column_letter(column[0].column)

        for cell in column:
            if cell.value is not None:
                max_length = max(
                    max_length,
                    len(str(cell.value))
                )

        worksheet.column_dimensions[column_letter].width = min(
            max_length + 4,
            45
        )

    # Alinear el contenido
    for row in worksheet.iter_rows():
        for cell in row:
            cell.alignment = Alignment(
                vertical="center"
            )

    # Título principal
    for cell in worksheet[1]:
        if cell.value is not None:
            cell.font = Font(
                bold=True,
                size=16,
                color="FFFFFF"
            )

            cell.fill = PatternFill(
                fill_type="solid",
                fgColor="343A40"
            )

            cell.alignment = Alignment(
                horizontal="center",
                vertical="center"
            )

    worksheet.row_dimensions[1].height = 30

    # Detectar y destacar encabezados de secciones
    section_titles = [
        "ESTADÍSTICAS GENERALES",
        "ESTADÍSTICAS DE PEDIDOS",
        "PEDIDOS POR ESTADO",
        "PEDIDOS POR TIPO",
        "PEDIDOS POR ORIGEN",
        "ESTADÍSTICAS DE VENTAS",
        "RESUMEN DE IMPORTES",
        "MEDIOS DE PAGO",
        "ESTADÍSTICAS DE PRODUCTOS",
        "ESTADO DEL INVENTARIO",
        "PRODUCTOS MÁS VENDIDOS",
        "VENTAS POR TAMAÑO",
        "PRODUCTOS SIN VENTAS",
        "ESTADÍSTICAS DE USUARIOS",
        "CLIENTES",
        "EMPLEADOS",
        "ADMINISTRADORES"
    ]

    for row in worksheet.iter_rows():
        for cell in row:
            if cell.value in section_titles:
                cell.font = Font(
                    bold=True,
                    color="FFFFFF"
                )

                cell.fill = PatternFill(
                    fill_type="solid",
                    fgColor="4472C4"
                )

                cell.alignment = Alignment(
                    vertical="center"
                )

    # Detectar encabezados de tablas
    for row in worksheet.iter_rows():
        values = [cell.value for cell in row]

        if values and values[0] in [
            "Concepto",
            "Estado",
            "Tipo",
            "Origen",
            "Producto",
            "Medio de pago"
        ]:
            for cell in row:
                if cell.value is not None:
                    cell.font = Font(
                        bold=True,
                        color="000000"
                    )

                    cell.fill = PatternFill(
                        fill_type="solid",
                        fgColor="D9EAF7"
                    )

    # Formato monetario
    currency_labels = [
        "Subtotal de ventas",
        "Cargos de envío",
        "Total de ventas",
        "Efectivo",
        "Transferencia"
    ]

    # Aplicar formato a importes identificados por su concepto
    for row in worksheet.iter_rows():
        if row[0].value in currency_labels and len(row) > 1:
            row[1].number_format = '"$"#,##0.00'

    # Detectar columnas que contienen importes
    for row in worksheet.iter_rows():
        for cell in row:
            if cell.value in ["Importe", "Importe vendido"]:

                column_index = cell.column
                current_row = cell.row + 1

                while current_row <= worksheet.max_row:
                    value_cell = worksheet.cell(
                        row=current_row,
                        column=column_index
                    )

                    # Detenerse al llegar a una fila vacía
                    if all(
                        worksheet.cell(
                            row=current_row,
                            column=col
                        ).value is None
                        for col in range(1, worksheet.max_column + 1)
                    ):
                        break

                    if value_cell.data_type == "n":
                        value_cell.number_format = '"$"#,##0.00'

                    current_row += 1

def createDashboardExcel(db, period="day", reference_date=None):

    # Obtener el resumen comercial según el período seleccionado
    if period == "day":
        business_summary = getBusinessDaySummary(db, reference_date)
    elif period == "week":
        business_summary = getBusinessWeekSummary(db, reference_date)
    else:
        raise ValueError("Período inválido. Debe ser 'day' o 'week'.")

    # Obtener las demás estadísticas del dashboard
    orders = getDashboardOrders(db, period, reference_date)
    users = getDashboardUsers(db, period, reference_date)
    products = getDashboardProducts(db, period, reference_date)

    # Crear el libro de Excel
    workbook = Workbook()

    # Obtener la hoja inicial y cambiarle el nombre
    summary_sheet = workbook.active
    summary_sheet.title = "Resumen"

    # Crear las demás hojas
    orders_sheet = workbook.create_sheet("Pedidos")
    sales_sheet = workbook.create_sheet("Ventas")
    products_sheet = workbook.create_sheet("Productos")
    users_sheet = workbook.create_sheet("Usuarios")

    # ==========================
    # HOJA: RESUMEN
    # ==========================

    summary_sheet.append(["RESUMEN DEL DASHBOARD"])

    summary_sheet.append(["Período", "Jornada" if period == "day" else "Semana"])

    # Convertir las fechas a un formato más legible
    start_date = business_summary["period"]["start"]
    end_date = business_summary["period"]["end"]

    if isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date)

    if isinstance(end_date, str):
        end_date = datetime.fromisoformat(end_date)

    summary_sheet.append([
        "Fecha de inicio",
        start_date.strftime("%d/%m/%Y %H:%M")
    ])

    summary_sheet.append([
        "Fecha de finalización",
        end_date.strftime("%d/%m/%Y %H:%M")
    ])

    summary_sheet.append([])

    summary_sheet.append(["ESTADÍSTICAS GENERALES"])

    summary_sheet.append(["Concepto", "Cantidad / Importe"])

    summary_sheet.append([
        "Pedidos totales",
        business_summary["orders"]["total"]
    ])

    summary_sheet.append([
        "Pedidos concretados (no cancelados)",
        business_summary["orders"]["sales"]
    ])

    summary_sheet.append([
        "Pedidos cancelados",
        business_summary["orders"]["cancelled"]
    ])

    summary_sheet.append([
        "Subtotal de ventas",
        business_summary["sales"]["subtotal"]
    ])

    summary_sheet.append([
        "Cargos de envío",
        business_summary["sales"]["delivery_fee"]
    ])

    summary_sheet.append([
        "Total de ventas",
        business_summary["sales"]["total"]
    ])

        # ==========================
    # HOJA: PEDIDOS
    # ==========================

    orders_sheet.append(["ESTADÍSTICAS DE PEDIDOS"])
    orders_sheet.append([])

    # Pedidos por estado
    orders_sheet.append(["PEDIDOS POR ESTADO"])
    orders_sheet.append(["Estado", "Cantidad"])

    status_labels = {
        "pending": "Pendientes",
        "confirmed": "Confirmados",
        "preparing": "En preparación",
        "ready": "Listos",
        "on_the_way": "En camino",
        "delivered": "Entregados",
        "cancelled": "Cancelados"
    }

    for status, quantity in orders["by_status"].items():
        orders_sheet.append([
            status_labels.get(status, status),
            quantity
        ])

    orders_sheet.append([])

    # Pedidos por tipo
    orders_sheet.append(["PEDIDOS POR TIPO"])
    orders_sheet.append(["Tipo", "Cantidad"])

    type_labels = {
        "delivery": "Delivery",
        "pickup": "Retiro en local",
        "table": "En mesa"
    }

    for order_type, quantity in orders["by_type"].items():
        orders_sheet.append([
            type_labels.get(order_type, order_type),
            quantity
        ])

    orders_sheet.append([])

    # Pedidos por origen
    orders_sheet.append(["PEDIDOS POR ORIGEN"])
    orders_sheet.append(["Origen", "Cantidad"])

    source_labels = {
        "customer": "Cliente",
        "employee": "Empleado"
    }

    for source, quantity in orders["by_source"].items():
        orders_sheet.append([
            source_labels.get(source, source),
            quantity
        ])

        # ==========================
    # HOJA: VENTAS
    # ==========================

    sales_sheet.append(["ESTADÍSTICAS DE VENTAS"])
    sales_sheet.append([])

    # Resumen de importes
    sales_sheet.append(["RESUMEN DE IMPORTES"])
    sales_sheet.append(["Concepto", "Importe"])

    sales_sheet.append([
        "Subtotal de ventas",
        business_summary["sales"]["subtotal"]
    ])

    sales_sheet.append([
        "Cargos de envío",
        business_summary["sales"]["delivery_fee"]
    ])

    sales_sheet.append([
        "Total de ventas",
        business_summary["sales"]["total"]
    ])

    sales_sheet.append([])

    # Medios de pago
    sales_sheet.append(["MEDIOS DE PAGO"])
    sales_sheet.append(["Medio de pago", "Importe"])

    payment_methods = business_summary["payment_methods"]

    transfer_total = (
        payment_methods["transfer"] +
        payment_methods["mercadopago"]
    )

    sales_sheet.append([
        "Efectivo",
        payment_methods["cash"]
    ])

    sales_sheet.append([
        "Transferencia",
        transfer_total
    ])

    # ==========================
    # HOJA: PRODUCTOS
    # ==========================

    products_sheet.append(["ESTADÍSTICAS DE PRODUCTOS"])
    products_sheet.append([])

    inventory = products["products"]
    sales = products["sales"]

    # Inventario
    products_sheet.append(["ESTADO DEL INVENTARIO"])
    products_sheet.append(["Concepto", "Cantidad"])

    products_sheet.append(["Productos totales", inventory["total"]])
    products_sheet.append(["Productos disponibles", inventory["available"]])
    products_sheet.append(["Productos no disponibles", inventory["unavailable"]])
    products_sheet.append(["Con control de stock", inventory["with_stock_control"]])
    products_sheet.append(["Stock bajo (1 a 5 unidades)", inventory["low_stock"]])
    products_sheet.append(["Sin stock", inventory["out_of_stock"]])

    products_sheet.append([])

    # Ranking de productos
    products_sheet.append(["PRODUCTOS MÁS VENDIDOS"])
    products_sheet.append([
        "Producto",
        "Unidades vendidas",
        "Importe vendido"
    ])

    for product in sales["products_ranking"]:
        products_sheet.append([
            product["product_name"],
            product["units_sold"],
            product["total_sold"]
        ])

    products_sheet.append([])

    # Ranking por tamaños
    products_sheet.append(["VENTAS POR TAMAÑO"])
    products_sheet.append([
        "Producto",
        "Tamaño",
        "Unidades vendidas",
        "Importe vendido"
    ])

    for size in sales["sizes_ranking"]:
        products_sheet.append([
            size["product_name"],
            size["size"],
            size["units_sold"],
            size["total_sold"]
        ])

    products_sheet.append([])

    # Productos sin ventas
    products_sheet.append(["PRODUCTOS SIN VENTAS"])
    products_sheet.append(["Producto"])

    for product in sales["without_sales"]:
        products_sheet.append([
            product["product_name"]
        ])

    products_sheet.append([
        "Total de productos sin ventas",
        sales["without_sales_count"]
    ])

        # ==========================
    # HOJA: USUARIOS
    # ==========================

    users_sheet.append(["ESTADÍSTICAS DE USUARIOS"])
    users_sheet.append([])

    customers = users["customers"]
    employees = users["employees"]
    admins = users["admins"]

    # Clientes
    users_sheet.append(["CLIENTES"])
    users_sheet.append(["Concepto", "Cantidad"])

    users_sheet.append(["Clientes totales", customers["total"]])
    users_sheet.append(["Clientes activos", customers["active"]])
    users_sheet.append(["Clientes inactivos", customers["inactive"]])
    users_sheet.append(["Nuevos clientes del período", customers["new"]])

    users_sheet.append([])

    # Empleados
    users_sheet.append(["EMPLEADOS"])
    users_sheet.append(["Concepto", "Cantidad"])

    users_sheet.append(["Empleados totales", employees["total"]])
    users_sheet.append(["Nuevos empleados del período", employees["new"]])

    users_sheet.append([])

    # Administradores
    users_sheet.append(["ADMINISTRADORES"])
    users_sheet.append(["Concepto", "Cantidad"])

    users_sheet.append(["Administradores totales", admins["total"]])
    users_sheet.append(["Nuevos administradores del período", admins["new"]])

    # Aplicar formato a todas las hojas
    for worksheet in workbook.worksheets:
        formatWorksheet(worksheet)

    # Guardar el libro en memoria
    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    return output