// Temp type extension for Home.tsx
import { RefObject } from 'react';
import { QuantityStepperRef } from '../../components/ui/stepper/QuantityStepper';

declare module '../../pages/Dashboard/Home' {
  interface Product {
    qtyRef?: RefObject<QuantityStepperRef>;
  }
}
