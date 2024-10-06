export const VendorWelcomeOnboard = (firstName: string, password: string ) => `


<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome Email</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f0f4f8;
    "
  >
    <!-- Email Container -->
    <table
      role="presentation"
      style="width: 100%; background-color: #f0f4f8"
      cellpadding="0"
      cellspacing="0"
    >
      <tr>
        <td align="center">
          <!-- Main Content Area -->
          <table
            role="presentation"
            style="
              max-width: 600px;
              width: 100%;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 10px;
            "
            cellpadding="0"
            cellspacing="0"
          >
            <tr>
              <td style="text-align: center">
                <!-- Logo -->
                <img
                  src="icon.png"
                  alt="ABH.com Logo"
                  style="width: 100px; margin-bottom: 20px"
                />
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding-bottom: 20px">
                <!-- Welcome Message -->
                <h1 style="color: #48b045; font-size: 36px; margin: 0">
                  Welcome!
                </h1>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 20px;
                  color: #333333;
                  font-size: 16px;
                  line-height: 1.5;
                "
              >
                <!-- Main Text -->
                <p>Dear ${firstName},</p>
                <p>
                  Thanks for signing up and creating an account with us. We are
                  so happy to have you! Your password is ${password}, please
                  remember to login to list your product.
                </p>
                <p>
                  You can access your account area to view and upload your
                  orders and returns
                  <a
                    href="https://vendor.abhmarkets.com/"
                    style="color: #48b045; text-decoration: none"
                    target="_blank"
                    >here</a
                  >.
                </p>
                <p>
                  Please be sure to add our email address to your 'safe sender'
                  list. If you've agreed for us to stay in touch with you, then
                  prepare yourself for lots of loveliness heading right your way
                  soon!
                </p>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 20px 0;
                  text-align: center;
                  background-color: #d4eecd;
                  color: #333333;
                  font-size: 16px;
                  line-height: 1.5;
                "
              >
                <!-- Need More Help Section -->
                <p style="margin: 0">Need more help?</p>
                <a
                  href="https://abhmarkets.com/contact-us"
                  style="color: #48b045; text-decoration: none"
                  target="_blank"
                  >We're here, ready to talk</a
                >
              </td>
            </tr>
          </table>
          <!-- Footer Section -->
          <table
            role="presentation"
            style="max-width: 600px; width: 100%; padding: 20px"
            cellpadding="0"
            cellspacing="0"
          >
            <tr>
              <td style="text-align: center; color: #333333; font-size: 14px">
                <!-- Social Media Links -->
                <a href="https://facebook.com" style="margin: 0 10px"
                  ><img
                    src="facebook-icon-url"
                    alt="Facebook"
                    style="width: 24px"
                /></a>
                <a href="https://twitter.com" style="margin: 0 10px"
                  ><img
                    src="twitter-icon-url"
                    alt="Twitter"
                    style="width: 24px"
                /></a>
                <a href="https://instagram.com" style="margin: 0 10px"
                  ><img
                    src="instagram-icon-url"
                    alt="Instagram"
                    style="width: 24px"
                /></a>
              </td>
            </tr>
            <tr>
              <td
                style="
                  text-align: center;
                  padding-top: 20px;
                  color: #999999;
                  font-size: 12px;
                "
              >
                <!-- Disclaimer -->
                <p style="margin: 0">
                  You are receiving this email because you have visited our site
                  or asked us about the regular newsletter. Make sure our
                  messages get to your inbox.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`