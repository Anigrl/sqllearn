import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,


    // Click 'View Credentials' below to copy your API secret
});

const uploadOn = async (localFile) => {
    try {
        if (!localFile) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFile, {
            resource_type: 'auto'
        })
        //file has been uplaoded successfully
        console.log("uploaded suceess of cloudi ", response.url)

        return response
    } catch (error) {
        fs.unlinkSync(localFile)  //remove the locally saved tempo file as the upload operatino get failed

        return null

    }
}

export {uploadOn }