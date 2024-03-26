export type DropdownOptions = (DropdownOption & Record<string, unknown>)[];

export type DropdownValue = string | number | null | undefined | (string | number)[];

export type DropdownOption = {
  id: string | number;
  selected?: boolean;
};
