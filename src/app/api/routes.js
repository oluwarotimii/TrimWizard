import formidable from 'formidable';
import fs, { mkdir, mkdirSync } from 'fs';
import Jimp from 'jimp';
import path from 'path';



export const config = {
    api: {
        bodyParser: false,
    },
};

 const uploadDir = path.join(process.cwd(), 'public/uploads');
 const croppedDir = path.join(process.cwd(), 'public/cropped');

 if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive : true});
if (!fs.existsSync(croppedDir)) fs mkdirSync(croppedDir, { recursive : true});

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

//Crop the image at a given path
async function cropImage(imagePath, fileName) {
    try {
        const image = await Jimp.read(imagePath);

        const originalWidth = image.bitmap.width;
        const originalHeight  = image.bitmap.width;


        const widthReduction = getRandomInt (60, 100);
        const heightReduction = getRandomInt(60, 100);

         const newWidth = originalWidth - widthReduction;
         const newHeight  = originalHeight - heightReduction;

          if (newWidth > 0 && newHeight > 0) {
            const croppedImage = image.crop(0,0,  newWidth, newHeight);

            const outputPath = path.join(croppedDir, 'cropped - ${fileName}');

            await croppedImage.writeAsync(outputPath);
             return { succes: falsse, message : 'Image too small to crop.'};
          }
    } catch (error){
        return { success: false, message: 'Error Cropping Image: ${error.message}'}
    }
    
    //API route handleer function

    export default async function handler(req, res) {
         const form = new formidable.IncomingForm({uploadDir: uploadDir,  keepExtensions: true});

         form.parse(req,  async (err, fields, files) => {
            if (err) {
                return res.status(500).json({message: 'Error parsing form data'});
            }

            const file = files.image;
            const filePath= file.filePath;
            const fileName = file.originalfilename;

            //Crop the image 

            const result = await cropImage(filePath, fileName);

            if(result.succes) {
                return res.status(200).json({ message: result.message, filePath: result.outputPath})
            } else {
                return res.status(400).json({message: result.message});
            }
         });
    };
}
