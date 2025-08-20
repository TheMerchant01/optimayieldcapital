import { NextResponse } from "next/server";
import UserModel from "../../../../mongodbConnect";
import nodemailer from "nodemailer";

export async function POST(request) {
  const { email, depositMethod, amount, transactionStatus, name, image } =
    await request.json();
  const lowerEmail = email.toLowerCase();
  const id = crypto.randomUUID();

  try {
    // Search for the user with the provided email
    const user = await UserModel.findOne({ email: lowerEmail });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // Generate current date in the desired format
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    user.depositHistory.push({
      id,
      dateAdded: currentDate,
      depositMethod,
      amount,
      transactionStatus,
    });

    // Save the changes to the user
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // Use Hostinger's SMTP host
      port: 465, // Port for secure SSL connection
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER, // Your email user
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    // Define email options
    const mailOptions = {
      from: "Optima Yield Capital <support@optima-yieldcapital.org>",
      to: email,
      subject: "Deposit Confirmation",
      html: `
        <p>Hello Admin,</p>
        <p>Please confirm the  deposit of $${amount} by ${name} using ${depositMethod} as at ${currentDate}. Please do well to verify</p>
        <p>Congrats and more wins 🥂🎉🎊</p>
        <p>Here's the transaction screenshot</p>
      <img src="${image}"/>
      `,
    };

    // Send the email asynchronously
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
    return NextResponse.json({
      success: true,
      message: user,
      id,
      date: currentDate,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "An error occurred: " + error,
    });
  }
}
