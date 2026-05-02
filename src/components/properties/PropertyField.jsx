export default function PropertyField({ field, value, onChange }) {
  const commonProps = {
    id: field.name,
    name: field.name,
    value: value ?? "",
    onChange: (event) => onChange(field.name, field.type === "number" ? Number(event.target.value) : event.target.value),
  };

  return (
    <label className="property-field">
      <span>{field.label}</span>
      {field.type === "select" ? (
        <select {...commonProps}>
          {field.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea {...commonProps} rows={4} />
      ) : (
        <input {...commonProps} type={field.type || "text"} />
      )}
    </label>
  );
}
