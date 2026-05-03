export type DialogOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
};

