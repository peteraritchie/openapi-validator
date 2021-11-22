const { CliRunner } = require('../src/utils/cli-runner');

describe('Cli Runner Builder', () => {
  describe('Init command line parameter', () => {
    test('should set up init command', async () => {
      const program = {};
      program.args = ['init'];

      const cliRunner = new CliRunner.Builder().setProgram(program).build();

      expect(cliRunner.command).toBe('init');
    });
  });

  describe('migrate command line parameter', () => {
    test('should set up migrate command', async () => {
      const program = {};
      program.args = ['migrate'];

      const cliRunner = new CliRunner.Builder().setProgram(program).build();

      expect(cliRunner.command).toBe('migrate');
    });
  });

  describe('files via command line', () => {
    test('should set up the provided single file', async () => {
      const program = {};
      program.args = ['./files/dummy.json'];

      const cliRunner = new CliRunner.Builder().setProgram(program).build();

      expect(cliRunner.filesToBeValidated).toEqual(program.args);
    });

    test('should setup the multiple provided files', async () => {
      const program = {};
      program.args = ['./files/dummy.json', './files/dummy.yml'];

      const cliRunner = new CliRunner.Builder().setProgram(program).build();

      expect(cliRunner.filesToBeValidated).toEqual(program.args);
    });

    test('should throw when no files are provided', async () => {
      const program = {};

      const cliRunnerBuilder = new CliRunner.Builder().setProgram(program);

      expect(() => {
        cliRunnerBuilder.build();
      }).toThrowError();
    });
  });

  describe('ruleset', () => {});

  describe('default mode', () => {
    test('should defaultMode be false when it is not set up', async () => {
      const program = {};

      const cliRunner = new CliRunner.Builder().setProgram(program).build();

      expect(cliRunner.defaultMode).toBeFalsy();
    });

    test('should defaultMode be true when it is set up', async () => {
      const program = {
        defaultMode: true
      };

      const cliRunner = new CliRunner.Builder().setProgram(program).build();

      expect(cliRunner.defaultMode).toBeTruthy();
    });
  });

  describe('config file override', () => {
    test('should be undefined when it is not provided', async () => {
      const program = {};

      const cliRunner = new CliRunner.Builder().setProgram(program).build();

      expect(cliRunner.configFileOverride).toBeUndefined();
    });

    test('should have the correct value when it is provided', async () => {
      const program = {
        configFileOverride: '.validaterc'
      };

      const cliRunner = new CliRunner.Builder().setProgram(program).build();

      expect(cliRunner.configFileOverride).toBe(program.configFileOverride);
    });
  });
});