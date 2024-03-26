export type Menu = {
  text: string,
  icon: string,
  expand: boolean,
  children?: { text: string, url: string, visible?: boolean; }[]
}