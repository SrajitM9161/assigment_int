export default function OptionInput({ index, option, onTextChange, onCorrectChange }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-3">
      <div className="flex items-center gap-3 w-full">
        <div className="w-5 h-5 bg-[#7765DA] text-white flex items-center justify-center rounded-full text-xs">
          {index + 1}
        </div>
        <input
          value={option.text}
          onChange={(e) => onTextChange(index, e.target.value)}
          className="flex-1 p-2 border rounded-md bg-gray-50"
          placeholder={`Option ${index + 1}`}
        />
      </div>

      <div className="flex items-center gap-3 text-sm whitespace-nowrap">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="correct"
            checked={option.isCorrect === true}
            onChange={() => onCorrectChange(index)}
          />
          Yes
        </label>
      </div>
    </div>
  );
}
