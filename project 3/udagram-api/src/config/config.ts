
export const config = {
  'username': process.env.DEV_POSTGRES_USERNAME,
  'password': process.env.DEV_POSTGRES_PASSWORD,
  'database': process.env.DEV_POSTGRES_DB,
  'host': process.env.DEV_POSTGRES_HOST,
 // 'port':process.env.DEV_POSTGRES_PORT,
  'dialect': 'postgres',
  'aws_region': process.env.AWS_REGION,
  'aws_profile': process.env.AWS_PROFILE,
  'aws_media_bucket': process.env.AWS_BUCKET,
  'url': process.env.URL,
  'jwt': {
    'secret': process.env.JWT_SECRET,
  },
  'dburi':`${process.env.DEV_POSTGRES_DB}://${process.env.DEV_POSTGRES_USERNAME}:${process.env.DEV_POSTGRES_PASSWORD}@${process.env.DEV_POSTGRES_HOST}/udagram`
};
