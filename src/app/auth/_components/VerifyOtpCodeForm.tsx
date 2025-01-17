"use client"

import {z} from "zod";
import {useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import ActionButton from "@/components/Button/ActionButton";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {buttonStyleVariants} from "@/components/Button/buttonStyleVariants";
import useAuthenticationService from "@/services/authentication/useAuthenticationService";
import {VerifyOtpCodeDto} from "@/services/authentication/dtos/request/VerifyOtpCodeDto";
import {handleFormApiErrors} from "@/lib/handleApiErrors";
import {SendOtpCodeDto} from "@/services/authentication/dtos/request/SendOtpCodeDto";
import {useRouter} from "next/navigation";
import {useDispatch} from "react-redux";
import {setMfa} from "@/store/features/auth/authSlice";

const schema = z.object({
    otpNumber: z.string({message: "Otp Number is required"}).min(6, {message: 'Otp Number is required'}),
});

type FormFields = z.infer<typeof schema>;

export default function VerifyOtpCodeForm({email}: { email: string }) {
    const router = useRouter()
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
    const {sendOtpCode, verifyOtpCode} = useAuthenticationService();


    const onResendOtpCode = async () => {

        const dto: SendOtpCodeDto = {email: decodeURIComponent(email)}
        await sendOtpCode(dto).then((response) => {
            if (response.success) {
                toast.success("Email Sent Successfully", {
                    description: "An email with the OTP code has been sent to your address.",
                })
            } else {
                toast.error("Login Error", {description: "An unexpected error occurred. Please try again."});
            }
        }).catch((err) => {
            handleFormApiErrors<FormFields>(err,
                setError,
                Object.keys(schema.shape),
                "Failed To Send Otp Code",
            )
        })
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const dto: VerifyOtpCodeDto = {email: decodeURIComponent(email), otp: data.otpNumber}

        await verifyOtpCode(dto)
            .then((response) => {
                if (response.success) {
                    toast.success("Otp verification successful")
                    dispatch(setMfa(response.data!))
                    router.push(`/auth/verify-mfa/${decodeURIComponent(email)}`);
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

        <>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full flex flex-col  items-center justify-center"
            >
                <div className="w-full flex flex-col gap-1 ">
                    <InputOTP
                        maxLength={6}
                        value={_value}
                        onChange={(value) => {
                            setInternalValue(value)
                            setValue("otpNumber", value)
                        }}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} invalid={!!(errors && errors.otpNumber?.message)}/>
                            <InputOTPSlot index={1} invalid={!!(errors && errors.otpNumber?.message)}/>
                            <InputOTPSlot index={2} invalid={!!(errors && errors.otpNumber?.message)}/>
                            <InputOTPSlot index={3} invalid={!!(errors && errors.otpNumber?.message)}/>
                            <InputOTPSlot index={4} invalid={!!(errors && errors.otpNumber?.message)}/>
                            <InputOTPSlot index={5} invalid={!!(errors && errors.otpNumber?.message)}/>
                        </InputOTPGroup>
                    </InputOTP>
                    {errors && (
                        <div
                            className="font-normal text-sm text-error-text">{errors.otpNumber?.message}</div>
                    )}
                    <p
                        className="font-[400] my-2 flex items-center text-sm text-gray-text "
                    >Didn&apos;t get a code?
                        <ActionButton
                            className={"ml-2 px-0 text-[13px]  italic"}
                            variant={"link"}
                            onClick={async () => {
                                await onResendOtpCode();
                            }}
                            type={"button"}
                        >
                            Click to resend
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
            <Link
                className={cn(
                    buttonStyleVariants({variant: "light", className: "my-4"}),
                )}
                href={"/auth/login"}
            >
                Change Email
            </Link>
        </>

    )
}
