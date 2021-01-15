import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import Login from '../../../src/components/dialogs/Login';

describe('<Login />', () => {
    it('should not display login dialog when open is false', () => {
        const fn = jest.fn();
        const { queryByLabelText } = render(<Login open={false} onClose={fn}></Login>);
        const username = queryByLabelText('Username');
        expect(username).toBe(null);
        const password = queryByLabelText('Password');
        expect(password).toBe(null);
        expect(fn).not.toHaveBeenCalled();
    });

    it('should display login dialog and close on cancel', () => {
        const handleClose = jest.fn();
        const { getByLabelText, getByTestId } = render(<Login open={true} onClose={handleClose}></Login>);
        const username = getByLabelText('Username');
        expect(username).toBeTruthy();
        const password = getByLabelText('Password');
        expect(password).toBeTruthy();
        const cancel = getByTestId('cancel');
        fireEvent.click(cancel);
        expect(handleClose).toHaveBeenCalled();
    });

    
});
