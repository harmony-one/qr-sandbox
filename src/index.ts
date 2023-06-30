import {StableDiffusionClient} from "./StableDiffusionClient";
import {createQRCode} from "./utils";
import * as fs from "fs";
import * as path from "path";

function isDirectoryExists(path: string) {
  try {
    const stats = fs.statSync(path);
    return stats.isDirectory();
  } catch (error) {
    // @ts-expect-error
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

const sdClient = new StableDiffusionClient();

export const runTest = async () => {
  if (!isDirectoryExists('images')) {
    fs.mkdirSync('images')
    console.log('### create dir images');

  }

  const qrUrl = 'https://h.country';
  const prompt = 'light, futobot, cyborg, (masterpiece),(best quality),(ultra-detailed), (full body:1.2), 1male, solo, hood up, upper body, mask, 1boy, male focus,white gloves, cloak, long sleeves, spaceship, lightning, hires';
  const qrMargin = 1;
  const imgCount = 1;
  // const guidanceStart = 20 // 0 - 100;
  const guidanceEnd = 85; // 0 - 100;
  const steps = 40;
  const width = 510;
  const height = 510;

  const qrImgBuffer = await createQRCode({ url: qrUrl, margin: qrMargin });

  console.log('### start');

  for (let _guidanceStart = 1; _guidanceStart < 20 ; _guidanceStart += 3) {
    for (let i = 0; i < imgCount; i++) {

      const timeStart = Date.now();

      const bufferImg = await sdClient.img2img({
        imgBase64: qrImgBuffer.toString('base64'),
        prompt,
        guidanceStart: _guidanceStart / 100,
        guidanceEnd: guidanceEnd / 100,
        steps: steps,
        width: width,
        height: height,
      })

      const time = Date.now() - timeStart;

      if (bufferImg) {
        const filePath = `images/qr_wh${width}_${height}_gStart_${_guidanceStart}_gEnd_${guidanceEnd}_i${i}.png`
        fs.writeFileSync(filePath, bufferImg)
        console.log('### generate qr', {guidanceStart: _guidanceStart, guidanceEnd, i, steps, timeS: time / 1000});
      }
    }
  }
}

runTest();