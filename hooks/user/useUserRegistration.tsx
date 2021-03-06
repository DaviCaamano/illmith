import axios from 'axios';
import { AxiosCatch, errorCodes, ErrorResponse } from '@error';
import { handleInputChange } from '@utils/handleInput';

//hooks
import { useCallback, useState } from 'react';
import { useAlert } from '@hooks';

//types
import { AlertTemplate, UserScreen } from '@contexts';
import { Dispatch as ReduxDispatch } from '@reduxjs/toolkit';
import { StatusCodes } from 'http-status-codes';
import { RegistrationError } from '@utils/server';
import { PasswordValidation, ValidatedPassword } from '@utils/user';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

export interface RegisterUserError {
  warning: string;
  email: string | null;
  username: string | null;
  password: string | null;
}
export interface RegisterUserState {
  username: string;
  email: string;
  password: string;
  subscribe: boolean;
  error: RegisterUserError;
  passwordValidation: PasswordValidation;
}

export interface RegisterUserValidators {
  handleEmail: () => boolean;
  handleUsername: () => boolean;
}

export interface RegisterUserInputHandlers {
  handlePassword: (validatedPassword: ValidatedPassword) => void;
  handleInput: (event: ChangeEvent<HTMLInputElement>) => void;
}

const initialInputs: RegisterUserState = {
  username: '',
  email: '',
  password: '',
  subscribe: false,
  error: {
    warning: '',
    email: '',
    username: '',
    password: '',
  },
  passwordValidation: {
    hasSixCharacters: false,
    hasCorrectCase: false,
    hasNumber: false,
  },
};

export interface UserRegistrationProps {
  form: RegisterUserState;
  setForm: Dispatch<SetStateAction<RegisterUserState>>;
  setModal: (screen?: UserScreen) => any;
  handleUserRegistration: () => void;
  inputHandlers: RegisterUserInputHandlers;
  validators: RegisterUserValidators;
}
export const useUserRegistration = (
  ReduxDispatch: ReduxDispatch,
  setModal: (screen?: UserScreen) => void
): UserRegistrationProps => {
  const [form, setForm] = useState<RegisterUserState>(initialInputs);
  const { username, email, password, subscribe, passwordValidation } = form;
  const { prompt } = useAlert(ReduxDispatch);

  const handleEmail = () => {
    if (!email) {
      setForm((prevState: RegisterUserState) => ({
        ...prevState,
        email: errorCodes.UserRegistration.emailFieldEmpty,
      }));
      return false;
    }
    const test = /^[^@\s]+@[^@\s.]+\.[^@.\s]+$/.test(email);
    if (!test) {
      setForm((prevState: RegisterUserState) => ({
        ...prevState,
        error: {
          ...prevState.error,
          email: errorCodes.UserRegistration.invalidEmail,
        },
      }));
    }
    return test;
  };

  const handleUsername = () => {
    if (!username) return true;
    const test = new RegExp(/[A-Za-z0-9_]+/).test(username);
    setForm((prevState: RegisterUserState) => ({
      ...prevState,
      error: {
        ...prevState.error,
        username: test ? '' : errorCodes.UserRegistration.invalidUsername,
      },
    }));
    return test;
  };

  const passwordIsValidated = (validations = passwordValidation) => {
    if (!password) {
      setForm((prevState: RegisterUserState) => ({
        ...prevState,
        error: {
          ...prevState.error,
          password: errorCodes.UserRegistration.passwordFieldEmpty,
        },
      }));
      return false;
    }
    const isValidated = validations.hasSixCharacters && validations.hasCorrectCase && validations.hasNumber;
    if (!isValidated) {
      setForm((prevState: RegisterUserState) => ({
        ...prevState,
        error: {
          ...prevState.error,
          password: errorCodes.UserRegistration.invalidPassword,
        },
      }));
      return false;
    }
    return true;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleInput = useCallback(handleInputChange<RegisterUserState>(setForm), []),
    handlePassword = useCallback(({ password, hasSixCharacters, hasCorrectCase, hasNumber }: ValidatedPassword) => {
      setForm((prevState: RegisterUserState) => ({
        ...prevState,
        password,
        passwordValidation: {
          hasSixCharacters,
          hasCorrectCase,
          hasNumber,
        },
      }));
    }, []),
    inputHandlers: RegisterUserInputHandlers = {
      handleInput,
      handlePassword,
    };

  const handleUserRegistration = () => {
    const passwordValidated = passwordIsValidated(passwordValidation),
      emailValidated = handleEmail(),
      usernameValidated = handleUsername();

    if (emailValidated && usernameValidated && passwordValidated) {
      setForm((prevState: RegisterUserState) => ({
        ...prevState,
        error: {
          warning: '',
          password: '',
          username: '',
          email: '',
        },
      }));
      axios
        .post('/api/user/register', {
          username,
          email,
          password,
          subscribe,
        })
        .then(() => {
          setForm(initialInputs);
          setModal();
          prompt({
            template: AlertTemplate.EmailNotificationPrompt,
            args: { message: 'Check your email for a validation link' },
          });
        })
        .catch(
          ({
            response: {
              data: { error, statusCode },
            },
          }: AxiosCatch<ErrorResponse<RegistrationError>>) => {
            if (statusCode === StatusCodes.TOO_MANY_REQUESTS) {
              setForm((prevState: RegisterUserState) => ({
                ...prevState,
                error: { ...prevState.error, warning: errorCodes.Login.tooManyAttempts },
              }));
            } else if (!error) {
              setForm((prevState: RegisterUserState) => ({
                ...prevState,
                error: {
                  ...prevState.error,
                  warning: errorCodes.Login.generic,
                },
              }));
            } else {
              const generalError =
                error.warning ?? (!error.email && !error.username && !error.password) ? errorCodes.Login.generic : '';
              const errorReport = {
                email: error.email ?? '',
                username: error.username ?? '',
                password: error.password ?? '',
                warning: generalError,
              };
              setForm((prevState: RegisterUserState) => ({
                ...prevState,
                error: {
                  ...prevState.error,
                  ...errorReport,
                },
              }));
            }
          }
        );
    }
  };

  return {
    form,
    setForm,
    setModal,
    handleUserRegistration,
    inputHandlers,
    validators: {
      handleEmail,
      handleUsername,
    },
  };
};
