import path  from "path"
import nodemailer from "nodemailer";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class EmailsController {

    static async sendMailNotiFy(to, title, description) {
        try {
            
        console.log(`Enviando email a ${to}, mensaje: ${title}`)

        let path = __dirname + '\\..\\plantillas_email\\notify.html';
        const html = readFileSync(path, "utf8");

        const compiled = html.replace("{{title}}", title).replace("{{description}}", description)


        const content = {
            subject: title,
            html: compiled,
        }

        await this.sendMail(to, content)

        console.log("enviado")
        } catch (error) {
            console.log("[ERROR EN EmailsController.sendMailNotiFy]")
            console.log(to)
            console.log(title)
            console.log(description)
            console.log(error)
        }

    }

   

  


    

    static async sendMail(to, content) {

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "sendemailsprueba@gmail.com", // tu usuario de gmail
                pass: "yrzphmfxwfviagkn" // tu contraseña de gmail
            }
        });

        let info = await transporter.sendMail({
            from: 'Dservices', // sender address
            to: to, // list of receivers
            subject: content.subject, // Subject line
            // text: content.text, // plain text body
            html: content.html // html body
        });

    }

}





export default EmailsController 