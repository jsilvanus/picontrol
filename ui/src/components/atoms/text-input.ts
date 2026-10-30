export interface TextInputProps {
  id: string;
  label?: string;
  type?: "text" | "password" | "number" | "url";
  placeholder?: string;
  value?: string | number;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  onInputAttr?: string;
  onChangeAttr?: string;
}

export function renderTextInput(props: TextInputProps): string {
  const type = props.type ?? "text";
  const disabledAttr = props.disabled ? " disabled" : "";
  const requiredAttr = props.required ? " required" : "";
  const valueAttr = props.value !== undefined ? ` value="${props.value}"` : "";
  const placeholderAttr = props.placeholder ? ` placeholder="${props.placeholder}"` : "";
  const oninputAttr = props.onInputAttr ? ` oninput="${props.onInputAttr}"` : "";
  const onchangeAttr = props.onChangeAttr ? ` onchange="${props.onChangeAttr}"` : "";
  const extraClass = props.className ?? "";

  return `<div class="w-full ${extraClass}">
    ${props.label ? `<label for="${props.id}" class="block text-on-surface-variant text-[10px] font-bold uppercase mb-1">${props.label}</label>` : ""}
    <input
      type="${type}"
      id="${props.id}"
      ${valueAttr}
      ${placeholderAttr}
      ${disabledAttr}
      ${requiredAttr}
      ${oninputAttr}
      ${onchangeAttr}
      class="w-full h-9 px-3 bg-surface-container rounded-lg border border-outline-variant/50 text-on-surface text-[13px] focus:outline-none focus:border-primary disabled:opacity-40 transition-colors"
    />
    ${props.helpText ? `<span class="text-[10px] text-on-surface-variant mt-1 block">${props.helpText}</span>` : ""}
  </div>`;
}
