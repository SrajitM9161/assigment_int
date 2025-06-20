export default function TimeDropdown({ value, onChange }) {
  const timeOptions = [30, 45, 60, 90, 120];

  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="min-w-[150px] border px-3 py-2 rounded-md"
    >
      {timeOptions.map((time) => (
        <option key={time} value={time}>
          {time} seconds
        </option>
      ))}
    </select>
  );
}
