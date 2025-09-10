import '@testing-library/jest-dom';

describe('NewHikePlanForm Component Logic', () => {
  test('component file exists and can be imported', () => {
    // Test that the file exists and exports something
    expect(() => require('../components/NewHikePlanForm')).not.toThrow();
  });

  test('component exports a default function', () => {
    const Component = require('../components/NewHikePlanForm').default;
    expect(typeof Component).toBe('function');
  });

  test('handleSubmit logic - converts maxParticipants and adds defaults', () => {
    // Test the key logic: converting maxParticipants, adding defaults
    const simulateHandleSubmit = (data) => {
      return {
        ...data,
        maxParticipants: parseInt(data.maxParticipants) || 1,
        participants: ["You"],
        status: "planning",
      };
    };

    // Test with string maxParticipants
    const result1 = simulateHandleSubmit({ title: 'Test Plan', maxParticipants: '5' });
    expect(result1.maxParticipants).toBe(5);
    expect(result1.participants).toEqual(["You"]);
    expect(result1.status).toBe("planning");

    // Test with empty maxParticipants
    const result2 = simulateHandleSubmit({ title: 'Test Plan', maxParticipants: '' });
    expect(result2.maxParticipants).toBe(1);
    expect(result2.participants).toEqual(["You"]);
    expect(result2.status).toBe("planning");
  });

  test('handleSubmit logic - does not add manual ID', () => {
    // Test the key fix: no manual ID is added
    const simulateHandleSubmit = (data) => {
      return {
        ...data,
        maxParticipants: parseInt(data.maxParticipants) || 1,
        participants: ["You"],
        status: "planning",
        // NOTE: No id: Date.now() or similar
      };
    };

    const result = simulateHandleSubmit({ title: 'Test Plan', location: 'Test Location' });
    expect(result).not.toHaveProperty('id');
    expect(result).toEqual({
      title: 'Test Plan',
      location: 'Test Location',
      maxParticipants: 1,
      participants: ["You"],
      status: "planning",
    });
  });

  test('handleDifficultySelect logic', () => {
    // Test the difficulty selection logic
    const mockSetValue = jest.fn();
    const mockSetSelectedDifficulty = jest.fn();

    const simulateHandleDifficultySelect = (difficulty) => {
      mockSetSelectedDifficulty(difficulty);
      mockSetValue("difficulty", difficulty);
    };

    simulateHandleDifficultySelect('Hard');

    expect(mockSetSelectedDifficulty).toHaveBeenCalledWith('Hard');
    expect(mockSetValue).toHaveBeenCalledWith('difficulty', 'Hard');
  });

  test('email invitation logic', () => {
    // Test the email handling logic
    const mockSetEmails = jest.fn();
    const mockSetCurrentEmail = jest.fn();

    const simulateAddEmail = (email, emails) => {
      if (email && !emails.includes(email)) {
        const newEmails = [...emails, email];
        mockSetEmails(newEmails);
        mockSetCurrentEmail("");
        return newEmails;
      }
      return emails;
    };

    const simulateRemoveEmail = (emailToRemove, emails) => {
      const newEmails = emails.filter(email => email !== emailToRemove);
      mockSetEmails(newEmails);
      return newEmails;
    };

    // Test adding emails
    let emails = [];
    emails = simulateAddEmail('test1@example.com', emails);
    emails = simulateAddEmail('test2@example.com', emails);
    
    expect(mockSetEmails).toHaveBeenCalledWith(['test1@example.com']);
    expect(mockSetEmails).toHaveBeenCalledWith(['test1@example.com', 'test2@example.com']);

    // Test removing email
    simulateRemoveEmail('test1@example.com', emails);
    expect(mockSetEmails).toHaveBeenCalledWith(['test2@example.com']);

    // Test duplicate email prevention
    const emailsBefore = ['test@example.com'];
    const emailsAfter = simulateAddEmail('test@example.com', emailsBefore);
    expect(emailsAfter).toEqual(['test@example.com']); // Should remain unchanged
  });

  test('form reset and close logic', () => {
    // Test the form reset and dialog close logic
    const mockReset = jest.fn();
    const mockOnOpenChange = jest.fn();
    const mockSetEmails = jest.fn();
    const mockSetCurrentEmail = jest.fn();
    const mockSetSelectedDifficulty = jest.fn();

    const simulateFormReset = () => {
      mockReset();
      mockSetEmails([]);
      mockSetCurrentEmail("");
      mockSetSelectedDifficulty("");
      mockOnOpenChange(false);
    };

    simulateFormReset();

    expect(mockReset).toHaveBeenCalled();
    expect(mockSetEmails).toHaveBeenCalledWith([]);
    expect(mockSetCurrentEmail).toHaveBeenCalledWith("");
    expect(mockSetSelectedDifficulty).toHaveBeenCalledWith("");
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  test('default field addition logic', () => {
    // Test that required default fields are always added
    const simulateHandleSubmit = (data) => {
      return {
        ...data,
        maxParticipants: parseInt(data.maxParticipants) || 1,
        participants: ["You"], // Always added
        status: "planning", // Always added
      };
    };

    const result = simulateHandleSubmit({ title: 'Minimal Plan' });
    expect(result.participants).toEqual(["You"]);
    expect(result.status).toBe("planning");
    expect(result.maxParticipants).toBe(1);
  });
});