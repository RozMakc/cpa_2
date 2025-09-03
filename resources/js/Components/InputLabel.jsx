export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
        {...props}
        className={ "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400 " + className}
      >
        {value ? value : children}
      </label>
    );
}
