module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('operations', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      weekday: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      opening_hour: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      closing_hour: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      barbershop_id: {
        type: Sequelize.INTEGER,
        references: { model: 'barbershops', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('operations');
  },
};
