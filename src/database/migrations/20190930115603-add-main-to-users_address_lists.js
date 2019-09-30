module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users_address_lists', 'main', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users_address_lists', 'main');
  },
};
