module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      barber_id: {
        type: Sequelize.INTEGER,
        references: { model: 'barbers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      service: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT(10, 2),
        allowNull: false,
      },
      barbershop_id: {
        type: Sequelize.INTEGER,
        references: { model: 'barbershops', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      canceled_at: {
        type: Sequelize.DATE,
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
    return queryInterface.dropTable('appointments');
  },
};
