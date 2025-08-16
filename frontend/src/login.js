import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff } from 'lucide-react';
import forestWaterfall from '@/assets/forest-waterfall.jpg';
export const LoginDialog = ({ open, onOpenChange, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = () => {
    // Mock login - just call the onLogin callback
    onLogin();
    onOpenChange(false);
  };
  return _jsx(Dialog, {
    open: open,
    onOpenChange: onOpenChange,
    children: _jsx(DialogContent, {
      className: 'sm:max-w-[500px] p-0 overflow-hidden',
      children: _jsxs('div', {
        className: 'relative',
        children: [
          _jsxs('div', {
            className: 'h-48 bg-cover bg-center relative',
            style: { backgroundImage: `url(${forestWaterfall})` },
            children: [
              _jsx('div', {
                className:
                  'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent',
              }),
              _jsxs('div', {
                className: 'absolute bottom-4 left-6 text-white',
                children: [
                  _jsx('h2', {
                    className: 'text-2xl font-bold',
                    children: 'Welcome Back',
                  }),
                  _jsx('p', {
                    className: 'text-white/90',
                    children: 'Continue your hiking journey',
                  }),
                ],
              }),
            ],
          }),
          _jsx('div', {
            className: 'p-6',
            children: _jsxs('div', {
              className: 'space-y-4',
              children: [
                _jsxs('div', {
                  className: 'space-y-2',
                  children: [
                    _jsx(Label, { htmlFor: 'email', children: 'Email' }),
                    _jsx(Input, {
                      id: 'email',
                      type: 'email',
                      placeholder: 'your@email.com',
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                    }),
                  ],
                }),
                _jsxs('div', {
                  className: 'space-y-2',
                  children: [
                    _jsx(Label, { htmlFor: 'password', children: 'Password' }),
                    _jsxs('div', {
                      className: 'relative',
                      children: [
                        _jsx(Input, {
                          id: 'password',
                          type: showPassword ? 'text' : 'password',
                          placeholder: 'Enter your password',
                          value: password,
                          onChange: (e) => setPassword(e.target.value),
                        }),
                        _jsx(Button, {
                          type: 'button',
                          variant: 'ghost',
                          size: 'sm',
                          className:
                            'absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent',
                          onClick: () => setShowPassword(!showPassword),
                          children: showPassword
                            ? _jsx(EyeOff, { className: 'h-4 w-4' })
                            : _jsx(Eye, { className: 'h-4 w-4' }),
                        }),
                      ],
                    }),
                  ],
                }),
                _jsx(Button, {
                  onClick: handleLogin,
                  className: 'w-full bg-gradient-trail text-primary-foreground',
                  children: 'Sign In to Dashboard',
                }),
                _jsxs('div', {
                  className: 'relative',
                  children: [
                    _jsx('div', {
                      className: 'absolute inset-0 flex items-center',
                      children: _jsx(Separator, { className: 'w-full' }),
                    }),
                    _jsx('div', {
                      className:
                        'relative flex justify-center text-xs uppercase',
                      children: _jsx('span', {
                        className: 'bg-background px-2 text-muted-foreground',
                        children: 'Or continue with',
                      }),
                    }),
                  ],
                }),
                _jsxs('div', {
                  className: 'grid grid-cols-2 gap-4',
                  children: [
                    _jsx(Button, {
                      variant: 'outline',
                      className: 'w-full',
                      children: 'Google',
                    }),
                    _jsx(Button, {
                      variant: 'outline',
                      className: 'w-full',
                      children: 'Facebook',
                    }),
                  ],
                }),
                _jsxs('div', {
                  className: 'text-center text-sm',
                  children: [
                    _jsx('span', {
                      className: 'text-muted-foreground',
                      children: "Don't have an account? ",
                    }),
                    _jsx(Button, {
                      variant: 'link',
                      className: 'h-auto p-0 text-forest',
                      children: 'Sign up',
                    }),
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
    }),
  });
};
//# sourceMappingURL=login.js.map
