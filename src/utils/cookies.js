export function getValueFromCookie(matcher) {
  if (typeof document !== "undefined") {
    return document.cookie.match(matcher) &&
      RegExp.$1 !== "" &&
      RegExp.$1 !== "null"
      ? RegExp.$1
      : null;
  }
}
