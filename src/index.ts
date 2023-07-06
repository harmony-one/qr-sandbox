import {StableDiffusionClient} from "./StableDiffusionClient";
import {createQRCode, isQRCodeReadable} from "./utils";
import * as fs from "fs";
import * as path from "path";
import lodash from 'lodash';

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

const DIR = 'images'
export const runTest = async () => {
  if (!isDirectoryExists(DIR)) {
    fs.mkdirSync(DIR)
    console.log('### create dir images');
  }

  // close-up face, upper body
  // const prompt = 'light, futobot, cyborg, (masterpiece),(best quality),(ultra-detailed), (full body:1.2), 1male, solo, hood up, upper body, mask, 1boy, male focus,white gloves, cloak, long sleeves, spaceship, lightning, hires';
  // const prompt = 'light, sitting girl, (masterpiece),(best quality),(ultra-detailed), (full body:1.2), cloak, lightning, hires';
  // const prompt = 'sitting girl, (masterpiece), (best quality), (ultra-detailed), (full body:1.2), cloak, lightning, hires';
  // const prompt = 'sitting girl, (masterpiece), (best quality), (ultra-detailed), lightning,lightning, hires';
  // const prompt = 'pretty face, happy girl, blue jeans, white t-shirt, blondie, (masterpiece), (best quality), (ultra-detailed), hires, simple background';
  // const prompt = 'astronaut, masterpiece, best quality, ultra-detailed, hires';
  // const prompt = 'astronaut, upper body, masterpiece, best quality, ultra-detailed, hires';
  // const prompt = '(spaceship), faced to view, small, single, red, best quality, ultra-detailed, hires';
  const prompt = 'lucy (cyberpunk), 1girl, arm up, asymmetrical hair, belt, bodysuit, covered mouth, covered navel, detached sleeves, grey eyes, hip vent, holding, holding weapon, looking at viewer, night, night sky, pouch, short hair, sky, solo, weapon, white hair, wire, short shorts, shorts, open jacket, <lora:lucy_offset:1>';

  const qrUrl = 'https://h.country';
  const qrMargin = 1;
  const negativePrompt = '(KHFB, AuroraNegative),(Worst Quality, Low Quality:1.4), overexposure, watermark, text, easynegative, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur, distorted face, blurry, draft, grainy, ng_deepnegative_v1_75t'
  const imgCount = 10;
  const guidanceStart = 23.7 // 0 - 100;
  const guidanceEnd = 84.5; // 0 - 100;
  const steps = 60;
  const width = 610;
  const height = 610;
  const directory = '' || Date.now().toString();

  const qrImgBuffer = await createQRCode({ url: qrUrl, margin: qrMargin, width: width });

  console.log('### start');

  const dirDest = path.join(DIR, directory);

  if (!isDirectoryExists(dirDest)) {
    fs.mkdirSync(dirDest, {recursive: true});
    console.log(`### create dir ${dirDest}`);
  }

  fs.writeFileSync(path.join(dirDest, 'qr.png'), qrImgBuffer)

  const config = {
    prompt,
    negativePrompt,
    steps,
    width,
    height,
    qrMargin,
    guidanceStart: guidanceStart / 100,
    guidanceEnd: guidanceEnd / 100,
    imgBase64: qrImgBuffer.toString('base64'),
  };

  fs.writeFileSync(path.join(dirDest, 'config.json'), JSON.stringify(lodash.omit(config, 'imgBase64'), null, 4));

  for (let i = 0; i < imgCount; i++) {
    const timeStart = Date.now();
    const bufferImg = await sdClient.img2img(config);

    const time = Date.now() - timeStart;

    if (bufferImg) {
      const readable = isQRCodeReadable(bufferImg);
      const filename = `qr_wh${width}_${height}_gStart_${guidanceStart}_gEnd_${guidanceEnd}_i${i}.png`;
      const filePath = path.join(dirDest, filename);
      fs.writeFileSync(filePath, bufferImg);
      console.log('### generate qr', {readable, i, timeS: time / 1000});
    }
  }
}

runTest();