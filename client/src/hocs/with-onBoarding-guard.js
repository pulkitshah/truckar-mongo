import { OnBoardingGuard } from "../components/authentication/onboarding-guard.js";

export const withOnBoardingGuard = (Component) => (props) =>
  (
    <OnBoardingGuard>
      <Component {...props} />
    </OnBoardingGuard>
  );
