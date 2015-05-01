/*
 * Copyright 2013 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.drugis.trialverse.security.repository.impl;

import org.apache.commons.codec.digest.DigestUtils;
import org.drugis.trialverse.security.Account;
import org.drugis.trialverse.security.UsernameAlreadyInUseException;
import org.drugis.trialverse.security.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.sql.ResultSet;
import java.sql.SQLException;

@Repository
public class AccountRepositoryImpl implements AccountRepository {

  @Inject
  @Qualifier("jtTrialverse")
  private JdbcTemplate jdbcTemplate;

  private RowMapper<Account> rowMapper = new RowMapper<Account>() {
    public Account mapRow(ResultSet rs, int rowNum) throws SQLException {
      return new Account(rs.getInt("id"), rs.getString("username"), rs.getString("firstName"), rs.getString("lastName"), rs.getString("hashedUserName"));
    }
  };

  @Transactional()
  public void createAccount(String email, String firstName, String lastName) throws UsernameAlreadyInUseException {
    String hashedUserName = DigestUtils.sha256Hex(email);
    try {
      jdbcTemplate.update(
              "insert into Account (firstName, lastName, username, hashedUserName) values (?, ?, ?, ?)",
              firstName, lastName,email, hashedUserName);
    } catch (DuplicateKeyException e) {
      throw new UsernameAlreadyInUseException(email);
    }
  }

  public Account findAccountByUsername(String username) {
    return jdbcTemplate.queryForObject(
            "select id, username, firstName, lastName, hashedUserName from Account where username = ?",
            rowMapper, username);
  }

  public Account findAccountById(int id) {
    return jdbcTemplate.queryForObject(
            "select id, username, firstName, lastName, hashedUserName from Account where id = ?",
            rowMapper, id);
  }

  @Override
  public Account findAccountByHash(String hash) {
    return jdbcTemplate.queryForObject(
            "select id, username, firstName, lastName, hashedUserName from Account where hashedUserName = ?",
            rowMapper, hash);
  }
}
