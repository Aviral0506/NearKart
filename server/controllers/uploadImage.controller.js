import uploadImageClodinary from '../utils/uploadImageClodinary.js'

const uploadImageController = async (request, response) => {
    try {
        const file = request.file

        if(!file){
            return response.status(400).json({
                message : "No file provided",
                error : true,
                success : false
            })
        }

        const uploadResult = await uploadImageClodinary(file)

        return response.json({
            message : "Image uploaded successfully",
            error : false,
            success : true,
            data : {
                url : uploadResult.secure_url
            }
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
export default uploadImageController