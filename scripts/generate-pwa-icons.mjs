import sharp from "sharp";
import path from "node:path";

/**
 * ABANG PH PWA ICON GENERATOR
 * ---------------------------
 *
 * We keep the original artwork as SVG because SVG is easy
 * to edit without losing quality.
 *
 * This script generates the raster PNG files required by
 * browsers and operating systems.
 *
 * Run:
 *
 *   npm run icons:generate
 */

const root =
  process.cwd();

const iconsDirectory =
  path.join(
    root,
    "public",
    "icons",
  );

const normalSource =
  path.join(
    iconsDirectory,
    "abang-icon.svg",
  );

const maskableSource =
  path.join(
    iconsDirectory,
    "abang-maskable.svg",
  );

async function generateIcon({
  source,
  output,
  size,
}) {
  await sharp(source)
    .resize(size, size)
    .png()
    .toFile(
      path.join(
        iconsDirectory,
        output,
      ),
    );

  console.log(
    `Generated ${output} (${size}x${size})`,
  );
}

async function main() {
  await generateIcon({
    source:
      normalSource,

    output:
      "abang-192.png",

    size:
      192,
  });

  await generateIcon({
    source:
      normalSource,

    output:
      "abang-512.png",

    size:
      512,
  });

  await generateIcon({
    source:
      maskableSource,

    output:
      "abang-maskable-512.png",

    size:
      512,
  });

  /**
   * Apple commonly uses a 180×180 touch icon.
   *
   * We use the normal Abang artwork here rather than the
   * full-bleed maskable source.
   */
  await generateIcon({
    source:
      normalSource,

    output:
      "apple-touch-icon.png",

    size:
      180,
  });
}

main().catch(
  (error) => {
    console.error(
      "Failed to generate PWA icons:",
      error,
    );

    process.exit(1);
  },
);