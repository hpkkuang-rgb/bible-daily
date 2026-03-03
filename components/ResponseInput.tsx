"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function ResponseInput({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "写下你的回应…",
}: Props) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="text-sm font-medium text-gray-700">我的回应</div>
      <p className="mt-1 text-sm text-gray-500">
        这段经文如何帮助你认识神、认识自己、认识你与神的关系？
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        rows={4}
        className="mt-3 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-800 placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
    </section>
  );
}
