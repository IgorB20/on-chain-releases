"use client";
import { Address, IExecDataProtector } from "@iexec/dataprotector";
import { useState } from "react";
import loader from "../assets/loader.gif";
import successIcon from "../assets/success.png";
import {
  checkCurrentChain,
  checkIsConnected,
  IEXEC_EXPLORER_URL,
} from "../utils/utils";
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

const iExecDataProtectorClient = new IExecDataProtector(window.ethereum);

export default function Home() {
  const [protectedData, setProtectedData] = useState<Address | "">("");

  // Loading and error states
  const [loadingProtect, setLoadingProtect] = useState(false);
  const [errorProtect, setErrorProtect] = useState("");
  const [loadingGrant, setLoadingGrant] = useState(false);
  const [errorGrant, setErrorGrant] = useState("");
  const [loadingRevoke, setLoadingRevoke] = useState(false);
  const [errorRevoke, setErrorRevoke] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);

  const protectedDataSubmit = async () => {
    setErrorProtect("");

    try {
      checkIsConnected();
      await checkCurrentChain();
    } catch (err) {
      setErrorProtect("Please install MetaMask");
      return;
    }

    if (!email) {
      setErrorProtect("Please enter a valid email address");
      return;
    }

    const data = { email };
    try {
      setLoadingProtect(true);
      const protectedDataResponse =
        await iExecDataProtectorClient.core.protectData({
          data: {
            file: email,
          },
          name,
        });
      console.log(protectedDataResponse);
      setProtectedData(protectedDataResponse.address as Address);
      setErrorProtect("");
    } catch (error) {
      setErrorProtect(String(error));
    }
    setLoadingProtect(false);
  };

  const readProtectedData = async () => {
    // const protectedDataAddress = "0x0b0286363CE4164cD44c6F5926bDc2272Ba17719";
    const oneProtectedData =
      await iExecDataProtectorClient.core.getProtectedData({
        protectedDataAddress: protectedData,
      });
    console.log("oneProtectedData", oneProtectedData);
  };

  const grantAccess = async () => {
    try {
      const grantedAccess = await iExecDataProtectorClient.core.grantAccess({
        protectedData: protectedData,
        authorizedApp: "0x088F210b340d6697EA396702b0848b3EF7C3fd46",
        authorizedUser: "0x46da11a9FD60E63085e487B6128626D1Da494DAD",
        numberOfAccess: 1000,
        onStatusUpdate: ({ title, isDone }) => {
          console.log(title, isDone);
        },
      });
      console.log(grantedAccess);
    } catch (error) {
      console.log(error);
    }
  };

  const processProtectedData = async () => {
    try {
      const processProtectedDataResponse =
        await iExecDataProtectorClient.core.processProtectedData({
          protectedData: protectedData,
          app: "0x088F210b340d6697EA396702b0848b3EF7C3fd46",
          workerpool: "0x0975bfce90f4748dab6d6729c96b33a2cd5491f5",
          path: "/content",
          args: JSON.stringify({
            iexec_result_encryption: false,
          }),
          // maxPrice: 10,
          // inputFiles: ["https://example.com/file1", "https://example.com/file2"],
          // secrets: {
          //   1: "secret1",
          //   2: "secret2",
          // },
          onStatusUpdate: ({ title, isDone }) => {
            console.log(title, isDone);
          },
        });
      const enc = new TextDecoder("utf-8");
      console.log(processProtectedDataResponse);
      console.log(processProtectedDataResponse.result);
      console.log(enc.decode(processProtectedDataResponse.result));
    } catch (error) {
      console.log(error);
    }
  };
  // Handlers
  const handleEmailChange = (event: any) => {
    setEmail(event.target.value);
    setIsValidEmail(event.target.validity.valid);
  };

  const handleNameChange = (event: any) => {
    setName(event.target.value);
  };

  return (
    <>
      {/* Protect Data Form */}
      <div>
        <h2>Protect your email address</h2>
        <div>
          <label>
            Email:{" "}
            <input
              type="email"
              required
              value={email}
              placeholder="Email"
              onChange={handleEmailChange}
            />
            {!isValidEmail && (
              <div style={{ color: "red" }}>
                Please enter a valid email address
              </div>
            )}
          </label>
        </div>
        <div>
          <label>
            ProtectedData Name:{" "}
            <input
              type="text"
              value={name}
              placeholder="Name"
              onChange={handleNameChange}
            />{" "}
          </label>
        </div>
        {errorProtect && (
          <div style={{ marginTop: "10px", maxWidth: 300, color: "red" }}>
            <h6>Creation failed</h6>
            {errorProtect}
          </div>
        )}
        {!loadingProtect ? (
          <button onClick={protectedDataSubmit}>Create</button>
        ) : (
          <img src={loader.src} alt="loading" height="30px" />
        )}

        <div>
          <button onClick={readProtectedData}>Read protected data</button>
        </div>
        <div>
          <button onClick={processProtectedData}>
            Process! protected data
          </button>
        </div>
        <div>
          <button onClick={grantAccess}>Grant Access</button>
        </div>
        {protectedData && !errorProtect && (
          <div style={{ marginTop: "4px" }}>
            <img
              src={successIcon.src}
              alt="success"
              height="30px"
              style={{ verticalAlign: "middle" }}
            />
            Your data has been protected!
            <a
              href={IEXEC_EXPLORER_URL + protectedData}
              rel="noreferrer"
              target="_blank"
            >
              You can check it here
            </a>
            <p>
              Your protected data address: <span>{protectedData}</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
