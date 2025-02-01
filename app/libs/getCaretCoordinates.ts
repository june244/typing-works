// 커서 위치 계산 함수 (Mirror Div 기법)
export const getCaretCoordinates = (
  element: HTMLTextAreaElement,
  position: number
): { x: number; y: number } => {
  const computed = window.getComputedStyle(element);

  // Mirror Div 생성
  const mirrorDiv = document.createElement("div");
  mirrorDiv.style.position = "absolute";
  mirrorDiv.style.whiteSpace = "pre-wrap";
  mirrorDiv.style.wordWrap = "break-word";
  mirrorDiv.style.visibility = "hidden";
  mirrorDiv.style.pointerEvents = "none";

  // textarea의 스타일 복제
  const propertiesToCopy = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "textTransform",
    "textAlign",
    "width",
    "lineHeight",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "borderStyle",
    "boxSizing",
    "borderWidth",
    "wordBreak",
  ];

  propertiesToCopy.forEach((prop) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    mirrorDiv.style[prop] = computed[prop];
  });

  // textarea의 스크롤 값 반영
  mirrorDiv.style.overflow = "hidden";
  mirrorDiv.style.whiteSpace = "pre-wrap";

  // 텍스트 복제 (커서 위치까지)
  const text = element.value.substring(0, position);
  mirrorDiv.textContent = text;

  // 커서 위치 표시를 위한 span 추가
  const span = document.createElement("span");
  span.textContent = "\u200B"; // zero-width space
  mirrorDiv.appendChild(span);

  // Mirror Div를 body에 추가
  document.body.appendChild(mirrorDiv);

  // span의 위치 측정
  const spanRect = span.getBoundingClientRect();
  const textareaRect = element.getBoundingClientRect();

  // 좌표 계산
  const x = spanRect.left - textareaRect.left + element.scrollLeft;
  const y = spanRect.top - textareaRect.top + element.scrollTop;

  // Mirror Div 제거
  document.body.removeChild(mirrorDiv);

  return { x, y };
};
