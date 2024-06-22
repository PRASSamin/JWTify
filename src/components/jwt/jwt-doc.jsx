import React, { useEffect, useState } from "react";
import JWTSignature from "../../assets/jwt-structure.png";
import "./jwt-doc.css";
import PageMenus from "../global/page-menus";

const JWTDoc = () => {
  const [AllPageMenus, setAllPageMenus] = useState([]);

  function fetchAllIds() {
    const allElements = document.querySelectorAll('*');
    const idsWithDataName = [];
  
    allElements.forEach(element => {
      const id = element.id;
      if (id && id !== "root") {
        const name = element.getAttribute('data-name');
        idsWithDataName.push({ id, name });
      }
    });
  
    return idsWithDataName;
  }
  
  
  useEffect(() => {
    const ids =  fetchAllIds();
    setAllPageMenus(
      ids.map(({ id, name }) => ({ id, name }))
    );
  }, []);

  return (
    <div
      className="relative lg:container w-[95%] md:w-[80%] mx-auto mt-14 mb-10"
    >
      <div id="what_is_jwt" data-name="What is JWT">
        <h1 className="text-[24px] md:text-[30px] font-semibold mb-1">
          What is JWT (JSON Web Token)?
        </h1>
        <p className="select-auto text-[15px] mb-8">
          JSON Web Token (JWT) is an open standard (RFC 7519) that defines a
          compact and self-contained way for securely transmitting information
          between parties as a JSON object. JWTs are commonly used for
          authentication and information exchange in web applications.
        </p>
        <h2 className="text-xl font-semibold mb-1">Structure of JWT</h2>
        <p className="select-auto text-[15px] mb-6">
          A JWT consists of three main parts separated by dots (.):
        </p>
        <ul className="list-decimal pl-4">
          <li className="mb-1">
            <span className="font-semibold">Header:</span> The header typically
            consists of two parts: the type of the token, which is JWT, and the
            signing algorithm being used, such as HMAC SHA256 or RSA.
          </li>
          <li className="mb-1">
            <span className="font-semibold">Payload (Claims):</span> The payload
            contains the claims, which are statements about an entity (typically
            the user) and additional data. There are three types of claims:
          </li>
          <ul className="list-disc pl-4">
            <li className="mb-1">
              <span className="font-semibold">Registered claims:</span> These
              are predefined claims that are not mandatory but recommended to
              provide a set of useful, interoperable claims. Some of these
              include iss (issuer), sub (subject), exp (expiration time), iat
              (issued at), etc.
            </li>
            <li className="mb-1">
              <span className="font-semibold">Public claims:</span> These can be
              defined at will by those using JWTs. But to avoid collisions, they
              should be defined in the IANA JSON Web Token Registry or be
              defined as a URI that contains a collision resistant namespace.
            </li>
          </ul>
          <li>
            <span className="font-semibold">Signature:</span> The signature is a
            digital signature that is used to ensure that the claims are not
            altered in transit.
          </li>
        </ul>
        <div className="w-full flex justify-center pt-12 pb-20 ">
          <img
            className=" w-[80%] sm:w-[70%] md:w-[60%] lg:w-[40%] p-4 border-dashed border-2 border-black rounded-lg"
            src={JWTSignature}
            alt="structure"
          />
        </div>
      </div>
      <div id="how_to_use" data-name="How to Use This Tool">
        <h1 className="text-[24px] md:text-[30px] font-semibold mb-1">
          How to Use This Tool
        </h1>
        <p className="select-auto text-[15px] mb-8">
          This JWT tool helps you encode, decode, and verify JSON Web Tokens
          (JWTs). Here’s a quick guide on how to use it:
        </p>
        <p className="select-auto text-[15px] mb-3">
          <span className="font-semibold">Encode: </span>To encode a JWT, start
          by selecting your desired signing algorithm from the dropdown menu.
          The tool supports various algorithms, including HS256, RS256, and
          ES256. Next, input your payload in the designated text area. This
          payload should be in JSON format and include the claims you want in
          your token. After entering the payload, provide the secret or private
          key in the "Key" field. This key is essential for signing the token.
          Once you’ve filled in these fields, click the "Generate" button to
          create the JWT. The generated token will be displayed, and you can
          copy it for use in your application.
        </p>
        <p className="select-auto text-[15px] mb-3">
          <span className="font-semibold">Decode: </span>Decoding a JWT is
          straightforward. Paste your JWT into the "Token" text area. The tool
          will automatically decode the token into its three parts: header,
          payload, and signature. The decoded header and payload will be
          displayed in their respective sections, with the signature shown
          separately. This allows you to inspect the contents of your token
          easily.
        </p>
        <p className="select-auto text-[15px] mb-3">
          <span className="font-semibold">Verify: </span>If you need to verify a
          JWT, first enable the verification feature by toggling the "Verify
          Signature?" switch. Ensure that the correct algorithm is selected and
          that the corresponding key is entered in the "Key" field. The tool
          will automatically verify the token’s signature against the provided
          key, displaying the result as "Valid" or "Invalid." This verification
          process ensures the token's integrity and authenticity.
        </p>
      </div>
      <PageMenus pageMenus={AllPageMenus}/>
    </div>
  );
};

export default JWTDoc;
