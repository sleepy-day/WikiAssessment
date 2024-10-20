export function CleanURLName(name: string): string {
    return name.replace(/[&$+,/:;=?@#<>\[\]|\\^%]/g, "");
}