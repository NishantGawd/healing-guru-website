const Razorpay = require("razorpay");

exports.handler = async (event) => {
    // The user's booking details are sent from the front-end
    const { serviceText, price } = JSON.parse(event.body);

    // Initialize Razorpay with your keys from secure environment variables
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: price * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_booking_${Date.now()}`,
        notes: {
            service: serviceText,
        },
    };

    try {
        // Create the order on Razorpay's servers
        const order = await razorpay.orders.create(options);

        // Send the successful order details back to the website
        return {
            statusCode: 200,
            body: JSON.stringify(order),
        };
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not create Razorpay order." }),
        };
    }
};