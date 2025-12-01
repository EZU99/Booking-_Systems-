import nodemailer from "nodemailer";
import Reserve from "../models/Reserve.js";

export const createReservation = async (req, res) => {
  try {
    const {
      SenderName,
      email,
      phone,
      events,
       Talk, 
      peopleAttend,
      message,
      ReservedDate,
      eventStartTime,
      eventEndTime,
    } = req.body;

    // Convert times to numbers for comparison
    const [startHour, startMinute] = eventStartTime.split(":").map(Number);
    const [endHour, endMinute] = eventEndTime.split(":").map(Number);

    // Check if times are within hall hours (08:00 – 22:00)
    if (
      startHour < 8 || startHour > 22 ||
      endHour < 8 || endHour > 22
    ) {
      return res.status(400).json({
        success: false,
        message: "Reservation time must be between 08:00 and 22:00",
      });
    }

    // Check if end time is after start time
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (endTotal <= startTotal) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Save reservation
    const newReserve = await Reserve.create({
      SenderName,
      email,
      phone,
      events,
      Talk,
      peopleAttend,
      message,
      ReservedDate,
      eventStartTime,
      eventEndTime,
    });

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Cinema Hall Booking" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Hall Reservation",
      html: `
        <h2>New Hall Reservation</h2>
        <p><strong>Name:</strong> ${SenderName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Preferred Contact Method:</strong> ${Talk}</p>
        <p><strong>Event:</strong> ${events}</p>
        <p><strong>People Attending:</strong> ${peopleAttend}</p>
        <p><strong>Start Time:</strong> ${eventStartTime}</p>
        <p><strong>End Time:</strong> ${eventEndTime}</p>
        <p><strong>Date:</strong> ${new Date(ReservedDate).toLocaleString()}</p>
        <p><strong>Message:</strong> ${message || "No message"}</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Reservation created and email sent successfully.",
      data: newReserve,
    });
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Get all reservations (for admin)
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reserve.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//  Approve reservation
export const approveReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Reserve.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }

    res.status(200).json({
      success: true,
      message: "Reservation approved successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Error approving reservation:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//  Delete reservation
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Reserve.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }

    res.status(200).json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting reservation:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
