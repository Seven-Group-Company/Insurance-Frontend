"use client"

import {z} from "zod";
import {useDispatch} from "react-redux";
import {useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSignInUser} from "@/hooks/auth/useSignInUser";
import useAuthenticationService from "@/services/authentication/useAuthenticationService";
import {VerifyMfaCodeDto} from "@/services/authentication/dtos/request/VerifyMfaCodeDto";
import {toast} from "sonner";
import {handleFormApiErrors} from "@/lib/handleApiErrors";
import {Separator} from "@/components/ui/separator";
import {User} from "lucide-react";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import ActionButton from "@/components/Button/ActionButton";
import {reConnectMfa} from "@/store/features/auth/authSlice";

interface VerifyProps {
    email: string;
    mfaQrCode: string
}

const schema = z.object({
    token: z.string({message: "Verification code is required"}).min(6, {message: 'Verification code is required'}),
});

type FormFields = z.infer<typeof schema>;

const Verify = ({email, mfaQrCode}: VerifyProps) => {


    const dispatch = useDispatch();
    const [_value, setInternalValue] = useState("")
    const {
        handleSubmit,
        setError,
        setValue,
        formState: {errors, isSubmitting},
    }
        = useForm<FormFields>({
        resolver: zodResolver(schema),
    });


    const onReConnectMfa = () => {
        dispatch(reConnectMfa({mfaQrCode: mfaQrCode, mfaEnabled: false}))
    }

    const {signInUser} = useSignInUser()
    const {verifyMfaCode} = useAuthenticationService();
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const dto: VerifyMfaCodeDto = {email: decodeURIComponent(email), token: data.token}

        await verifyMfaCode(dto)
            .then((response) => {
                if (response.success) {
                    signInUser(response.data!, "/", true)
                } else {
                    toast.error("Login Error", {description: "An unexpected error occurred. Please try again."});
                }
            })
            .catch((error) => {
                handleFormApiErrors<FormFields>(error,
                    setError,
                    Object.keys(schema.shape),
                    "OTP Verification Error"
                )
            })
    };
    return (
        <div
            className={"w-[450px] md:p-8  md:drop-shadow-2xl md:rounded-md    bg-gray-white"}
        >
            <h3
                className="text-gray-text mb-2 text-[1.5rem] font-[700]"
            >
                Verify Your Identity
            </h3>
            <p className="mb-2 text-[.85rem] text-gray-text">
                To keep your account secure we verify your identity.
            </p>
            <p className="text-[.85rem] text-gray-text">
                Enter the code generated by your authenticator app.
            </p>
            <Separator
                className={"my-4"}
            />

            <h1
                className="text-[1rem] font-bold text-gray-text"
            >Account</h1>
            <div
                className={"flex items-center gap-1 "}
            >
                <User
                    size={16}
                />
                <p
                    className={"text-[.8rem] text-gray-text-caption"}
                >{email}</p>
            </div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full my-4  flex flex-col gap-4  items-center justify-center"
            >
                <div className="w-full flex flex-col gap-1 ">
                    <p
                        className={"text-[.8rem] text-gray-text"}
                    >Verification code *</p>
                    <InputOTP
                        maxLength={6}
                        value={_value}
                        onChange={(value) => {
                            setInternalValue(value)
                            setValue("token", value)
                        }}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} invalid={!!(errors && errors.token?.message)}/>
                            <InputOTPSlot index={1} invalid={!!(errors && errors.token?.message)}/>
                            <InputOTPSlot index={2} invalid={!!(errors && errors.token?.message)}/>
                            <InputOTPSlot index={3} invalid={!!(errors && errors.token?.message)}/>
                            <InputOTPSlot index={4} invalid={!!(errors && errors.token?.message)}/>
                            <InputOTPSlot index={5} invalid={!!(errors && errors.token?.message)}/>
                        </InputOTPGroup>
                    </InputOTP>
                    {errors && (
                        <div
                            className="font-normal text-sm text-error-text">{errors.token?.message}</div>
                    )}
                    <p
                        className="font-[400] flex items-center text-sm text-gray-text "
                    >
                        <ActionButton
                            className={"px-0 text-[13px]  italic"}
                            variant={"link"}
                            onClick={async () => {
                                onReConnectMfa()
                            }}
                            type={"button"}
                        >
                            Click to reconnect your authenticator app.
                        </ActionButton>
                    </p>

                </div>

                <ActionButton
                    className={"w-full pb-3"}
                    loading={isSubmitting}
                    type={"submit"}>
                    Sign in
                </ActionButton>
            </form>

        </div>
    )
}

export default Verify;