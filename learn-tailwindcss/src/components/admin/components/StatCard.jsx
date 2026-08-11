const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="card bg-base-100 shadow-sm border">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-70">{title}</p>

            <h2 className="text-3xl font-bold mt-2">{value}</h2>
          </div>

          <Icon size={32} className="opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
