import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";


function Userlogin() {

    const BASE_URL = import.meta.env.VITE_POS_STORE_BASE_URL;
    const navigate = useNavigate();
    const [email_id, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();
        const loginData = {
            email_id: email_id,
            password: password
         
        };
        
          // console.log(loginData)
        try {

           const response = await fetch(`${BASE_URL}user_login_token/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                   
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem("userToken", data.data.token);
                sessionStorage.setItem("userEmail", email_id);
                sessionStorage.setItem("userName", data.data.first_name)
                navigate("/dashboard");
            } else {
                alert(data.message || "Invalid Login");
            }
        } catch (error) {
            console.log(error);
        }

    };

    const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex flex-col flex-1">
     
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
          
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input name="email_id" placeholder="Enter Email"
                            value={email_id}
                            onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Button className="w-full" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>

            
          </div>
        </div>
      </div>
    </div>
  );
}
export default Userlogin;
