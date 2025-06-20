function RoleCard({ title, description, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-4 cursor-pointer transition hover:shadow-md w-full md:w-64 ${
        selected ? 'border-primary bg-primary/10' : 'border-gray-300'
      }`}
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm mt-1 text-gray-500">{description}</p>
    </div>
  );
}

export default RoleCard;
