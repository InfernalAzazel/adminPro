import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import router from '@/router';
import './globals.css';
import { RecoilRoot } from 'recoil';
import { QueryClient,QueryClientProvider} from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      suspense: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <QueryClientProvider client={queryClient}>
     <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
    </QueryClientProvider>
  </React.StrictMode>,
)
