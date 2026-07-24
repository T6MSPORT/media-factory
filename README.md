# Media Factory v2.0

Background rendering fix: the complete uploaded image is displayed using contain/meet. A separate blurred cover layer fills the canvas behind it, preventing empty space without cropping the primary image. Background position, scale and reset controls remain available.

# Media Factory v1.5

Individual-driver motorsport graphic generator.

## Changes in v1.5

- Driver name restored across all templates.
- Template hero image is now a background image only.
- Driver profile image remains a separate foreground layer.
- Added background position and scale controls.
- Added one-click background reset.

## Run

```bash
npm install
npm run dev
```


## Image memory protection
Uploaded images are resized and compressed in the browser before they are rendered or stored. Backgrounds are capped at 2200px, portraits at 1800px, and logos at 900px. This prevents high-resolution phone or camera images from exhausting browser memory or local storage.


## v1.6 background fit fix
- Background images now use contain/meet fitting by default so the full uploaded image remains visible.
- Background scale can be reduced to 50% and repositioned with the existing controls.


## v1.9 changes
- Background images use full-image fit by default to prevent cropping.
- Home cards, statistics, accents and template thumbnails inherit the selected branding palette.
- Profile inputs are contained and previews now sit underneath them.
- Driver preview is large and uncropped; team and competition logo previews are stacked.


## v1.9
- Background images use cover fitting at scale 1, so the canvas is always filled.
- Added a black-to-transparent bottom overlay above image layers.
- Added driver image position, scale and reset controls when a driver portrait is available.


## v2.2 background behaviour
- Preserves source aspect ratio.
- Automatically covers the full template.
- Overflow remains outside the visible SVG canvas.
- Background can be panned using sliders or direct drag.
- Scale is relative to the automatic cover size and cannot reveal empty canvas.
- Centre and reset controls restore predictable positioning.


## v2.3 background correction
- Background uses preserveAspectRatio="xMidYMid meet".
- The full uploaded image is visible at reset with no automatic crop or distortion.
- Unused canvas is filled by the existing branded background layer.
- Background scale can be reduced to 50%.
- “Fit full image” recentres and resets scale.


## v2.7 fixes
- Application UI keeps its standard font; branding fonts remain limited to generated graphics and branding preview.
- Home driver card contains long names within two lines and keeps number/name/team left aligned.
- All saved sponsors (up to 10) render in the sponsor bar, five per row, including graphics created before sponsors 5–10 were added.
- Locked intrinsic background renderer unchanged.


## v2.7 changes
- Sponsor rows are centred within the graphic, including incomplete rows.
- Branding font selection is limited to five motorsport-style families: Orbitron, Rajdhani, Teko, Oxanium and Russo One.
- Existing generic font choices migrate safely to Orbitron/Rajdhani.
- The locked intrinsic background renderer is unchanged.


## v2.8 fixes
- Restored Branding page by defining the five motorsport font options used by the selector.
- Corrected Saved Graphics thumbnail layer order so template text is rendered above the diagonal graphic.
- Main graphic and locked background renderer unchanged.


## v3.0
- Driver profile preview now uses the uploaded portrait's intrinsic aspect ratio and displays the complete image without a fixed-height crop.
- Export/template driver rendering is unchanged.


## v3.3
- Sponsor logos now use measured processed dimensions.
- Visible logo area is normalised, rather than merely fitting every asset into the same box.
- Aspect ratios remain unchanged and all rows remain centre-distributed.
- Existing logos fall back safely; re-uploading records exact dimensions.
- Locked background renderer unchanged.


## v3.3
- Event Poster redesigned with stacked driver name, team identity and stylised number top-left.
- NEXT RACE is locked on two lines with round, track and date below.
- Event Poster time, headline override and subheadline override controls removed.
- Shared background renderer unchanged.


## v3.6
- Event Poster identity is now a single horizontal, vertically centred row: number, driver name, and team logo/name.
- Competition logo moved below the identity row.
- Event date displays as full day and month only (for example, 24 July).
- Date input calendar icon is white.
- Locked background renderer unchanged.


## v3.7 Event Poster top fade

- Added a black-to-transparent fade from the top of the Event Poster only.
- Fade sits above the background and below the driver, logos and all text.
- Shared background image renderer remains unchanged.

## v3.8 Event Poster adjustments
- Team identity is anchored to the right edge using fixed SVG coordinates so preview and PNG export match.
- NEXT RACE moved lower.
- Diagonal stripe moved lower for the Event Poster only.
- Round and date text enlarged.
- NEXT RACE, round, track and date use consistent vertical gaps.
