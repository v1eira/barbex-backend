module.exports = {
  up: queryInterface => {
    return queryInterface.removeColumn('addresses', 'main');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('addresses', 'main', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
};
