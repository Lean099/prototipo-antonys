function getColor(name) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];

  const index = name.charCodeAt(0) % colors.length;

  return colors[index];
}

const Avatar = ({ name, w, h, props = '' }) => {
  const initial = name?.charAt(0).toUpperCase() || 'A';
  const bgColor = getColor(name || 'A');

  return (
    <div
      tabIndex={0}
      role="button"
      className={`
        ${props}
        ${bgColor}
        rounded-full
        text-white
        flex
        items-center
        justify-center
        font-bold
        leading-none
      `}
      style={{
        width: `${w}px`,
        height: `${h}px`,
      }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
