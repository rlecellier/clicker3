import type { ReactNode } from 'react';

type TitleProperties = { children: ReactNode };

export const Title = ({ children }: TitleProperties) => <h1>{children}</h1>;
