import { PlatformType } from '../platform';

export type Icon = {
  icon: any[];
};

export function extractSvgString(
  platformType: PlatformType,
  icon: Icon
): string {
  const path = icon.icon[4];
  const scale = platformType === PlatformType.JUPYTER_LAB ? '0.025' : '0.03';
  return `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16">
    <g class="jp-icon3" fill="#616161">
      <path transform="scale(${scale}, ${scale}) translate(0, 0)" d="${path}" />
    </g>
  </svg>`;
}
