import nodemailer from 'nodemailer'

const sendEmail = async(email,subject,message)=>{
    try {
        let transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            auth:{
                user:'gurdev191004@gmail.com',
                pass:'bfgupuuyfvhskmkh'
            }
        })

        await transporter.sendMail({
            from:'gurdev191004@gmail.com',
            to:email,
            subject:subject,
            html:message
        })

        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.log('Error sending email',error);
        throw new Error('Could not send email. Please try again later.');

    }
}

export default sendEmail;