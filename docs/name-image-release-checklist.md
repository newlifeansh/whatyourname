# Name Image Release Checklist

## Goal

Fill every result-card avatar slot with a generated `public/name-images/*.png` portrait before release.

## Progress Flow

- Continue male name images first until `male.pending` is `0`.
- Continue female name images next until `female.pending` is `0`.
- After each batch, run `npm run sync:name-images`.
- Check progress with `npm run report:name-images`.
- Validate paths with `npm run validate:content`.

## Final Checks Before Deploy

- Compare result-card avatar sizing against `/Users/sukhwan/Downloads/KakaoTalk_Photo_2026-05-09-18-06-13.png`.
- Open the app and visually check several male and female result cards.
- Run `npm run typecheck`.
- Run `npm run build`.
- Deploy only after all images are complete and card QA looks good.
