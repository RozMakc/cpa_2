import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import InputLabel from "./InputLabel";
import { Calendar } from "lucide-react";


export default function DatePicker({
  id,
  mode = "single",
  onChange,
  label,
  defaultDate,
  placeholder = "Выберите дату",
  disabled = false,
  required = false,
  minDate,
  maxDate,
  dateFormat = "Y-m-d",
  enableTime = false,
  className = ""
}) {
  const inputRef = useRef(null);
  const flatpickrInstance = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const config = {
      mode: mode,
      static: true,
      monthSelectorType: "static",
      dateFormat: dateFormat,
      defaultDate: defaultDate,
      enableTime: enableTime,
      minDate: minDate,
      maxDate: maxDate,
      onChange: onChange,
      locale: {
        firstDayOfWeek: 1,
        weekdays: {
          shorthand: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
          longhand: [
            "Воскресенье",
            "Понедельник",
            "Вторник",
            "Среда",
            "Четверг",
            "Пятница",
            "Суббота"
          ]
        },
        months: {
          shorthand: [
            "Янв",
            "Фев",
            "Мар",
            "Апр",
            "Май",
            "Июн",
            "Июл",
            "Авг",
            "Сен",
            "Окт",
            "Ноя",
            "Дек"
          ],
          longhand: [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь"
          ]
        }
      }
    };

    // Инициализируем flatpickr
    flatpickrInstance.current = flatpickr(inputRef.current, config);

    // Получаем первый инстанс (flatpickr возвращает массив)
    const instance = Array.isArray(flatpickrInstance.current) 
      ? flatpickrInstance.current[0] 
      : flatpickrInstance.current;

    // Устанавливаем начальное состояние disabled
    if (disabled) {
      instance.set("clickOpens", false);
      inputRef.current.disabled = true;
    } else {
      instance.set("clickOpens", true);
      inputRef.current.disabled = false;
    }

    return () => {
      if (instance && instance.destroy) {
        instance.destroy();
      }
    };
  }, [mode, defaultDate, minDate, maxDate, dateFormat, enableTime, onChange]);

  // Обновляем disabled состояние
  useEffect(() => {
    if (!flatpickrInstance.current || !inputRef.current) return;

    const instance = Array.isArray(flatpickrInstance.current) 
      ? flatpickrInstance.current[0] 
      : flatpickrInstance.current;

    if (disabled) {
      instance.set("clickOpens", false);
      inputRef.current.disabled = true;
    } else {
      instance.set("clickOpens", true);
      inputRef.current.disabled = false;
    }
  }, [disabled]);

  const handleContainerClick = () => {
    if (disabled || !flatpickrInstance.current) return;

    const instance = Array.isArray(flatpickrInstance.current) 
      ? flatpickrInstance.current[0] 
      : flatpickrInstance.current;

    instance.open();
  };

  return (
    <div className={className}>
      {label && (
        <InputLabel htmlFor={id} required={required}>
          {label}
        </InputLabel>
      )}

      <div 
        className={`relative ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={handleContainerClick}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          readOnly
          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs 
                   placeholder:text-gray-400 focus:outline-none focus:ring-3 
                   bg-white text-gray-800 border-gray-300 
                   focus:border-brand-300 focus:ring-brand-500/20
                   dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 
                   dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <Calendar className="size-6" />
        </span>
      </div>
    </div>
  );
}