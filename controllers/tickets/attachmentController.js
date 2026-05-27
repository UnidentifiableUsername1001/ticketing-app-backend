const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const pino = require('pino');
const logger = pino();
const dotenv = require('dotenv');


const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const getUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.query;

        if (!fileName || !fileType) {
            return res.status(400).json({message: "fileName and fileType query parameters are required"});
        }

        const uniqueKey = `attachments/${Date.now()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: uniqueKey,
            ContentType: fileType,
        });

        const presignedUrl = await getSignedUrl(s3, command, {expiresIn: 60});

        const publicFileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`

        logger.info(`Generated presigned URL for key: ${uniqueKey}`);

        return res.status(200).json({
            uploadUrl: presignedUrl,
            fileUrl: publicFileUrl,
            fileName: fileName,
            fileType: fileType
        });
    } catch (e) {
        logger.error('Error generating presigned URL', e);
        return res.status(500).json({ message: "Internal server error", details: error.message });
    }
};

module.exports = { getUploadUrl };